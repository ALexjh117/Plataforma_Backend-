import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Perfil from '#models/perfil'

export default class Modulo extends BaseModel {
  static table = 'modulo'

  @column({ isPrimary: true, columnName: 'id_modulo' })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare descripcion: string | null

  @column()
  declare estado: boolean

  @column({ columnName: 'id_modulo_padre' })
  declare idModuloPadre: number | null

  @belongsTo(() => Modulo, { foreignKey: 'idModuloPadre' })
  declare padre: BelongsTo<typeof Modulo>

  @hasMany(() => Modulo, { foreignKey: 'idModuloPadre' })
  declare hijos: HasMany<typeof Modulo>

  @manyToMany(() => Perfil, {
    pivotTable: 'modulo_perfil',
    localKey: 'id',
    pivotForeignKey: 'id_modulo',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_perfil',
    pivotColumns: ['estado'],
  })
  declare perfiles: ManyToMany<typeof Perfil>
}
