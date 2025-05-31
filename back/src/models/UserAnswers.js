import { DataTypes, Model } from 'sequelize';

class UserAnswers extends Model {
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
        question_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "questions", key: "id" },
            onDelete: "CASCADE",
        },
        choose: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_correct: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
      },
      {
        sequelize,
        modelName: 'UserAnswers',
        tableName: 'user_answers',
        underscored: true
      }
    );
  }
}

export default UserAnswers;
