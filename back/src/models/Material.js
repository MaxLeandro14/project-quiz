import { DataTypes, Model } from 'sequelize';

class Materials extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        room_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: "rooms", key: "id" },
          onDelete: "CASCADE"
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "CASCADE"
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false
        },
        file_url: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        transcript_text: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        url: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        is_room_created: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        }
      },
      {
        sequelize,
        modelName: 'Material',
        tableName: 'materials',
        underscored: true
      }
    );
  }
}

export default Materials;