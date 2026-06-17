/**
 * File: src/infra/database/seed.ts
 * Purpose: Seed the database with a default admin user using TypeORM.
 *
 * Usage: npm run db:seed
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity.js';
import { Role } from '../../shared/constants/roles.constant.js';

const dataSource = new DataSource({
   type: 'postgres',
   url: process.env.DATABASE_URL,
   entities: [User],
   synchronize: false,
});

async function main() {
   await dataSource.initialize();
   const userRepository = dataSource.getRepository(User);
   const password = await bcrypt.hash('Admin@123!', 12);
   const existing = await userRepository.findOne({ where: { email: 'admin@example.com' } });

   if (existing) {
      console.log('Admin user already exists:', existing.email);
   } else {
      const admin = userRepository.create({
         email: 'admin@example.com',
         password,
         firstName: 'System',
         lastName: 'Admin',
         role: Role.ADMIN,
         isEmailVerified: true,
      });
      await userRepository.save(admin);
      console.log('Seeded admin user:', admin.email);
   }
}

main()
   .catch((e) => {
      console.error(e);
      process.exit(1);
   })
   .finally(async () => {
      await dataSource.destroy();
   });
