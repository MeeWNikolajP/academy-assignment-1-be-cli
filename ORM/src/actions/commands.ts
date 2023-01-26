import { DataSource } from 'typeorm';
import * as fs from 'fs';
import { supabase } from '../supabase';
import { filesInFolder } from './utils';

/**
 * -- Clear --
 *
 * Clears the database and removes auth users
 */

export const clear = async (dataSource: DataSource) => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  const tableNames = dataSource.entityMetadatas.map((entity) => entity.tableName);

  await dataSource.transaction(async (manager) => {
    for (const tableName of tableNames) {
      await manager.query(`TRUNCATE "${tableName}" RESTART IDENTITY CASCADE;`);
    }
  });

  console.log('Removing auth users');
  const listResponse = await supabase.auth.admin.listUsers();

  for (const user of listResponse.data.users) {
    await supabase.auth.admin.deleteUser(user.id);
  }
  console.log('Removed all auth users');
};

/**
 * -- Clear --
 *
 * Clears the database and removes auth users
 */

export const drop = async (dataSource: DataSource) => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  const tableNames = dataSource.entityMetadatas.map((entity) => entity.tableName);

  await dataSource.transaction(async (manager) => {
    for (const tableName of tableNames) {
      await manager.query(`DROP TABLE "${tableName}" CASCADE;`);
    }
  });

  console.log('Removing auth users');
  const listResponse = await supabase.auth.admin.listUsers();

  for (const user of listResponse.data.users) {
    await supabase.auth.admin.deleteUser(user.id);
  }
  console.log('Removed all auth users');
};

/**
 * -- Execute set --
 *
 * Executes a set of sql and ts scripts
 */

type SetOptions = {
  shouldClear?: boolean;
};

export const executeSet = async (dataSource: DataSource, path: string, options?: SetOptions) => {
  const set = JSON.parse(fs.readFileSync(path).toString()) as string[];

  const shouldClear = options?.shouldClear ?? false;

  if (shouldClear) {
    await clear(dataSource);
  }

  await dataSource.transaction(async (manager) => {
    for (const item of set) {
      if (item.endsWith('**/*.ts')) {
        const files = filesInFolder(__dirname + '/../' + item.replace('**/*.ts', ''));

        for (const file of files) {
          const module = await import(__dirname + '/../' + item.replace('**/*.ts', '') + file);
          await module.execute(manager);
        }
      } else if (item.endsWith('**/*.sql')) {
        const files = filesInFolder(__dirname + '/../../../' + item.replace('**/*.sql', ''));

        for (const file of files) {
          const sql = fs.readFileSync(__dirname + '/../../../' + item.replace('**/*.sql', '') + file);
          await manager.query(sql.toString());
        }
      } else if (item.endsWith('.ts')) {
        const module = await import(__dirname + '/../' + item);
        await module.execute(manager);
      } else if (item.endsWith('.sql')) {
        const sql = fs.readFileSync(__dirname + '/../../../' + item);
        await manager.query(sql.toString());
      } else {
        throw new Error('Unknown file type in set ' + item + '. Items must end with either .ts, .sql, **/*.sql or **/*.ts');
      }
    }
  });

  console.log('Finished executing set');
};
