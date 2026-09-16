import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import TrainingCenter from '#models/training_center'

export default class Regional extends BaseModel {
  static table = 'regional'

  @column({ isPrimary: true, columnName: 'id_regional' })
  declare id: number

  @column()
  declare nombre: string

  @hasMany(() => TrainingCenter, { foreignKey: 'idRegional' })
  declare trainingCenters: HasMany<typeof TrainingCenter>
}
