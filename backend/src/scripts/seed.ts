import 'dotenv/config';
import { connectDB } from '@config/db';
import env from '@config/env';
import { logger } from '@config/logger';
import { User } from '@modules/user/user.model';
import { hash } from 'bcrypt';

async function seedSuperUser() {
    try {
        
        // Connect to DB to running this script
        await connectDB();
        logger.info('Running seed script...');

        // Checks if super user / exisiting user is already created
        const existingUser = await User.findOne({email: env.SUPER_EMAIL});
        if(existingUser)
        {
            logger.warn('Supper user already exists, skipping.');
            return;
        }

        // Hash super user password 
        const hashedPassword = await hash(env.SUPER_PASS, 10);

        // Create the super user in the mongo db
        await User.create({
            email: env.SUPER_EMAIL,
            password: hashedPassword,
            role: 'super_user',
        });

        logger.info('Super user created successfully.');
    }
    catch(error)
    {
        logger.error('Seed failed: ' + error);
        process.exitCode = 1;
    }
    finally{
        process.exit();
    }
}

seedSuperUser();