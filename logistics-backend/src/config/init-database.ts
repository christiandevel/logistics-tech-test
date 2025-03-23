import { pgPool } from "./database";
import bcrypt from "bcryptjs";
import colors from "colors";

interface User {
  email: string;
  password: string;
  full_name: string;
  role: "admin" | "user" | "driver";
  email_verified: boolean;
  requires_password_change: boolean;
}

const SQL_QUERIES = {
  CREATE_USER_ROLE_ENUM: `
		DO $$ BEGIN
			CREATE TYPE user_role AS ENUM ('admin', 'user', 'driver');
		EXCEPTION
			WHEN duplicate_object THEN null;
		END $$;
	`,

  CREATE_USER_TABLE: `
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			email VARCHAR(255) NOT NULL UNIQUE,
			password VARCHAR(255) NOT NULL,
			full_name VARCHAR(255) NOT NULL,
			role user_role NOT NULL DEFAULT 'user',
			email_verified BOOLEAN NOT NULL DEFAULT false,
			requires_password_change BOOLEAN NOT NULL DEFAULT false,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`,

  CREATE_SHIPMENTS_TABLE: `
		CREATE TABLE IF NOT EXISTS shipments (
			id SERIAL PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES users(id),
			driver_id INTEGER NOT NULL REFERENCES users(id),
			origin VARCHAR(255) NOT NULL,
			destination VARCHAR(255) NOT NULL,
			destination_zipcode VARCHAR(255) NOT NULL,
			destination_city VARCHAR(255) NOT NULL,
			weight VARCHAR(255) NOT NULL,
			width VARCHAR(255) NOT NULL,
			height VARCHAR(255) NOT NULL,
			length VARCHAR(255) NOT NULL,
			product_type VARCHAR(255) NOT NULL,
			is_fragile BOOLEAN NOT NULL DEFAULT false,
			special_instructions VARCHAR(255) NOT NULL,
			tracking_number VARCHAR(255) NOT NULL,
			status VARCHAR(255) NOT NULL DEFAULT 'pending',
			estimated_delivery_date DATE,
			assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`,

  CREATE_HISTORY_SHIPMENTS_TABLE: `
		CREATE TABLE IF NOT EXISTS history_shipments (
			id SERIAL PRIMARY KEY,
			shipment_id INTEGER NOT NULL REFERENCES shipments(id),
			user_id INTEGER NOT NULL REFERENCES users(id),
			notes TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`,

  CREATE_UPDATE_TIMESTAMP_FUNCTION: `
		CREATE OR REPLACE FUNCTION update_timestamp_column()
		RETURNS TRIGGER AS $$
		BEGIN
			NEW.updated_at = NOW();
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
	`,

  CREATE_USER_UPDATE_TRIGGER: `
		CREATE TRIGGER user_update_trigger
		BEFORE UPDATE ON users
		FOR EACH ROW
		EXECUTE PROCEDURE update_timestamp_column();
	`,

  CHECK_USER_EXISTS: `
		SELECT * FROM users WHERE email = $1;
	`,

  INSET_USER: `
		INSERT INTO users (email, password, full_name, role, email_verified, requires_password_change)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING *;
	`,

  CHECK_DATABASE_CONNECTION: `
		SELECT 1;
	`,

  CHECK_TABLE_EXISTS: `
		SELECT EXISTS (
			SELECT FROM information_schema.tables
			WHERE table_schema = 'public'
			AND table_name = 'users'
		);
	`,
};

const INITAL_DATA: User[] = [
  {
    email: "admin@admin.com",
    password: "admin2025",
    full_name: "Administrator",
    role: "admin" as const,
    email_verified: true,
    requires_password_change: false,
  },
  {
    email: "user@user.com",
    password: "user2025",
    full_name: "User",
    role: "user" as const,
    email_verified: true,
    requires_password_change: false,
  },
  {
    email: "driver@driver.com",
    password: "driver2025",
    full_name: "Driver",
    role: "driver" as const,
    email_verified: true,
    requires_password_change: false,
  },
];

export const initializeDatabase = async () => {
  try {
    console.log(colors.green.bold(`Initializing database...`));

    await pgPool.query(SQL_QUERIES.CHECK_DATABASE_CONNECTION);
    console.log(
      colors.green.bold(`Database connection established successfully`)
    );

    await pgPool.query(SQL_QUERIES.CREATE_USER_ROLE_ENUM);
    await pgPool.query(SQL_QUERIES.CREATE_USER_TABLE);
    await pgPool.query(SQL_QUERIES.CREATE_SHIPMENTS_TABLE);
    await pgPool.query(SQL_QUERIES.CREATE_HISTORY_SHIPMENTS_TABLE);

    console.log(colors.green.bold(`Database tables created successfully`));

    const users = INITAL_DATA;
    for (const user of users) {
      const existUser = await pgPool.query(SQL_QUERIES.CHECK_USER_EXISTS, [
        user.email,
      ]);

      if (existUser.rows.length === 0) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(user.password, salt);

        await pgPool.query(SQL_QUERIES.INSET_USER, [
          user.email,
          hash,
          user.full_name,
          user.role,
          user.email_verified,
          user.requires_password_change,
        ]);
      }
    }
    console.log(colors.green.bold(`Users created successfully`));
  } catch (error) {
    console.error(colors.red.bold(`Error initializing database: ${error}`));
    process.exit(1);
  }
};
