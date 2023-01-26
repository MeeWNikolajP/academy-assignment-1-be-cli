import { Entity, Column, ManyToMany, JoinTable, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IOSSubscription } from '../subscriptions/IOSSubscription';
import { Role } from './Role';

/**
 * This entity contains the profile information for a user that is not login related.
 * All login related information is stored in the supabase builtin table 'auth.users'
 * which this entity is related to. The constraint to that table cannot be made through typeorm
 * since it is in another schema but it is created through an sql script (SQL/constraints/profile-constraint.sql)
 * which is executed after running the 'npm run sync' command
 */
@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  fullname: string;

  @Column()
  phonenumber: string;

  @Column()
  birthday: string;

  @Column({ default: false })
  subscription_active: boolean;

  @ManyToMany(() => Role, { cascade: ['insert', 'update'] })
  @JoinTable({
    name: 'profile_role_junction',
    joinColumn: {
      name: 'profile_fk',
    },
    inverseJoinColumn: {
      name: 'role_fk',
    },
  })
  roles: Role[];

  @ManyToOne(() => IOSSubscription, { nullable: true })
  @JoinColumn({
    name: 'ios_subscription_fk',
    referencedColumnName: 'id',
  })
  ios_subscription_fk: IOSSubscription;
}
