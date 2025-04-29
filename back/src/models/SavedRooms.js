import { DataTypes, Model } from 'sequelize';

class SavedRooms extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "CASCADE",
        },
        room_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "rooms", key: "id" },
          onDelete: "CASCADE",
        },
        saved_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        }
      },
      {
        sequelize,
        modelName: 'SavedRooms',
        tableName: 'saved_rooms',
        underscored: true
      }
    );
  }
}

export default SavedRooms;
