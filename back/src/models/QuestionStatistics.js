import { DataTypes, Model } from 'sequelize';

class QuestionStatistics extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
          },
          question_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "questions", key: "id" },
            onDelete: "CASCADE",
          },
          total_attempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          correct_answers: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          incorrect_answers: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          difficulty_easy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          difficulty_medium: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          difficulty_hard: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
      },
      {
        sequelize,
        modelName: 'QuestionStatistics',
        tableName: 'question_statistics',
        underscored: true
      }
    );
  }
}

export default QuestionStatistics;