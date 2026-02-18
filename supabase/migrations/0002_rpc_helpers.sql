create or replace function public.decrement_card(p_user_id uuid, p_card_id text)
returns void language plpgsql as $$
begin
  update public.user_collections
    set quantity = quantity - 1
    where user_id = p_user_id and card_id = p_card_id;
  delete from public.user_collections
    where user_id = p_user_id and card_id = p_card_id and quantity <= 0;
end;
$$;
