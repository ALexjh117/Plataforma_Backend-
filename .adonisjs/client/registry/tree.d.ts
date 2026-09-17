/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  account: {
    profile: {
      show: typeof routes['account.profile.show']
      update: typeof routes['account.profile.update']
      changePassword: typeof routes['account.profile.change_password']
    }
    accessTokens: {
      destroy: typeof routes['account.access_tokens.destroy']
    }
  }
  modules: {
    modules: {
      index: typeof routes['modules.modules.index']
      tree: typeof routes['modules.modules.tree']
      catalog: typeof routes['modules.modules.catalog']
      store: typeof routes['modules.modules.store']
    }
  }
  roles: {
    roles: {
      index: typeof routes['roles.roles.index']
      store: typeof routes['roles.roles.store']
      show: typeof routes['roles.roles.show']
      update: typeof routes['roles.roles.update']
      syncModules: typeof routes['roles.roles.sync_modules']
    }
  }
  users: {
    users: {
      options: typeof routes['users.users.options']
      index: typeof routes['users.users.index']
      store: typeof routes['users.users.store']
      show: typeof routes['users.users.show']
      update: typeof routes['users.users.update']
    }
  }
}
