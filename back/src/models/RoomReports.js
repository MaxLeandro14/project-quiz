import { DataTypes, Model } from 'sequelize';

class RoomReports extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        room_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "rooms", key: "id" },
          onDelete: "CASCADE"
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "CASCADE"
        },
        reason: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        modelName: 'RoomReports',
        tableName: 'room_reports',
        underscored: true
      }
    );
  }
}

export default RoomReports;
