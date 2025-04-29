import { DataTypes, Model } from 'sequelize';

class Subscription extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "CASCADE"
        },
        provider: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'stripe'
        },
        subscription_provider_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        customer_provider_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        plan: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        current_period_start: {
            type: DataTypes.DATE,
            allowNull: false
        },
        current_period_end: {
            type: DataTypes.DATE,
            allowNull: false
        }
      },
      {
        sequelize,
        modelName: 'Subscription',
        tableName: 'subscription',
        underscored: true
      }
    );
  }
}

export default Subscription;
