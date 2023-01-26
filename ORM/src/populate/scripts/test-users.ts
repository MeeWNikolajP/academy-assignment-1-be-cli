import { EntityManager } from 'typeorm';
import { Role } from '../../entity/auth/Role';
import { Profile } from '../../entity/auth/Profile';
import { createOrUseSupabaseUser } from '../util/user-utilities';
import { PopulateScriptExecutor } from '../util/types';

export const execute: PopulateScriptExecutor = async (manager: EntityManager) => {
  const authUser1 = await createOrUseSupabaseUser('test1@mail.dk', '12345678');
  const authUser2 = await createOrUseSupabaseUser('test2@mail.dk', '12345678');

  const adminRole = await manager.findOne(Role, { where: { name: 'admin' } });
  const userRole = await manager.findOne(Role, { where: { name: 'user' } });

  const adminProfile = new Profile();
  adminProfile.email = 'test1@mail.dk';
  adminProfile.fullname = 'Bob Marley';
  adminProfile.phonenumber = '+4524682468';
  adminProfile.birthday = '1997-07-09';
  adminProfile.roles = [adminRole];
  adminProfile.id = authUser1.id;

  await manager.save(adminProfile);

  const profile = new Profile();
  profile.email = 'test1@mail.dk';
  profile.fullname = 'Barack Obama';
  profile.phonenumber = '+4512345678';
  profile.birthday = '1965-02-03';
  profile.roles = [userRole];
  profile.id = authUser2.id;

  await manager.save(profile);
};
