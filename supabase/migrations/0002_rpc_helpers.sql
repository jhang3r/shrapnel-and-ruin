-- Safe decrement: raises exception if not enough quantity
create or replace function public.decrement_card(p_user_id uuid, p_card_id text)
returns void language plpgsql as $$
declare
  v_quantity integer;
begin
  select quantity into v_quantity
    from public.user_collections
    where user_id = p_user_id and card_id = p_card_id;

  if v_quantity is null or v_quantity < 1 then
    raise exception 'User % does not own card %', p_user_id, p_card_id;
  end if;

  if v_quantity = 1 then
    delete from public.user_collections
      where user_id = p_user_id and card_id = p_card_id;
  else
    update public.user_collections
      set quantity = quantity - 1
      where user_id = p_user_id and card_id = p_card_id;
  end if;
end;
$$;

-- Atomic trade execution: verifies ownership and swaps cards in one transaction
create or replace function public.execute_trade(p_trade_id uuid, p_recipient_id uuid)
returns jsonb language plpgsql as $$
declare
  v_trade record;
  v_card_id text;
  v_qty integer;
begin
  -- Lock and fetch trade, changing status atomically to prevent double-execution
  select * into v_trade
    from public.trades
    where id = p_trade_id
      and recipient_id = p_recipient_id
      and status = 'pending'
    for update;  -- row lock prevents concurrent execution

  if not found then
    return jsonb_build_object('error', 'Trade not found or already processed');
  end if;

  -- Mark as processing immediately to prevent concurrent calls
  update public.trades set status = 'processing' where id = p_trade_id;

  -- Verify initiator still owns all offered cards
  foreach v_card_id in array v_trade.offered_card_ids loop
    select quantity into v_qty
      from public.user_collections
      where user_id = v_trade.initiator_id and card_id = v_card_id;
    if v_qty is null or v_qty < 1 then
      raise exception 'Initiator no longer owns card %', v_card_id;
    end if;
  end loop;

  -- Verify recipient still owns all requested cards
  foreach v_card_id in array v_trade.requested_card_ids loop
    select quantity into v_qty
      from public.user_collections
      where user_id = p_recipient_id and card_id = v_card_id;
    if v_qty is null or v_qty < 1 then
      raise exception 'Recipient does not own card %', v_card_id;
    end if;
  end loop;

  -- Transfer offered cards: initiator → recipient
  foreach v_card_id in array v_trade.offered_card_ids loop
    perform public.decrement_card(v_trade.initiator_id, v_card_id);
    insert into public.user_collections (user_id, card_id, quantity)
      values (p_recipient_id, v_card_id, 1)
      on conflict (user_id, card_id)
      do update set quantity = public.user_collections.quantity + 1;
  end loop;

  -- Transfer requested cards: recipient → initiator
  foreach v_card_id in array v_trade.requested_card_ids loop
    perform public.decrement_card(p_recipient_id, v_card_id);
    insert into public.user_collections (user_id, card_id, quantity)
      values (v_trade.initiator_id, v_card_id, 1)
      on conflict (user_id, card_id)
      do update set quantity = public.user_collections.quantity + 1;
  end loop;

  -- Mark accepted
  update public.trades set status = 'accepted' where id = p_trade_id;

  return jsonb_build_object('ok', true);

exception when others then
  -- On any error, revert to pending so the caller can retry/investigate
  update public.trades set status = 'pending' where id = p_trade_id;
  return jsonb_build_object('error', SQLERRM);
end;
$$;
