import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'account.profile.show': { paramsTuple?: []; params?: {} }
    'account.profile.update': { paramsTuple?: []; params?: {} }
    'account.profile.change_password': { paramsTuple?: []; params?: {} }
    'account.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'modules.modules.index': { paramsTuple?: []; params?: {} }
    'modules.modules.tree': { paramsTuple?: []; params?: {} }
    'modules.modules.catalog': { paramsTuple?: []; params?: {} }
    'modules.modules.store': { paramsTuple?: []; params?: {} }
    'roles.roles.index': { paramsTuple?: []; params?: {} }
    'roles.roles.store': { paramsTuple?: []; params?: {} }
    'roles.roles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'roles.roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'roles.roles.sync_modules': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.options': { paramsTuple?: []; params?: {} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.store': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'account.profile.show': { paramsTuple?: []; params?: {} }
    'modules.modules.index': { paramsTuple?: []; params?: {} }
    'modules.modules.tree': { paramsTuple?: []; params?: {} }
    'modules.modules.catalog': { paramsTuple?: []; params?: {} }
    'roles.roles.index': { paramsTuple?: []; params?: {} }
    'roles.roles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.options': { paramsTuple?: []; params?: {} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'account.profile.show': { paramsTuple?: []; params?: {} }
    'modules.modules.index': { paramsTuple?: []; params?: {} }
    'modules.modules.tree': { paramsTuple?: []; params?: {} }
    'modules.modules.catalog': { paramsTuple?: []; params?: {} }
    'roles.roles.index': { paramsTuple?: []; params?: {} }
    'roles.roles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.options': { paramsTuple?: []; params?: {} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'account.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'modules.modules.store': { paramsTuple?: []; params?: {} }
    'roles.roles.store': { paramsTuple?: []; params?: {} }
    'users.users.store': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'account.profile.update': { paramsTuple?: []; params?: {} }
    'account.profile.change_password': { paramsTuple?: []; params?: {} }
    'roles.roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'roles.roles.sync_modules': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}