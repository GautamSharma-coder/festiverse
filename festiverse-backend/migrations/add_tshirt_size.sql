ALTER TABLE users ADD COLUMN IF NOT EXISTS t_shirt_size VARCHAR(10);
NOTIFY pgrst, 'reload schema';
