-- Add unique constraint to opportunity_motivation_forms table to prevent duplicate submissions
ALTER TABLE `opportunity_motivation_forms`
ADD CONSTRAINT `unique_opportunity_user` UNIQUE (`opportunity_id`, `user_email`);
