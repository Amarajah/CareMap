const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CareMap APIs',
      version: '1.0.0',
      description: 'Documentation Of All APIs Used In The CareMap Project',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server'
      },
      //{
       // url: process.env.PRODUCTION_URL || 'https://your-backend.onrender.com',
        //description: 'Production server'
      //}
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        Article: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Article ID'
            },
            title: {
              type: 'string',
              description: 'Article title'
            },
            description: {
              type: 'string',
              description: 'Article summary/description'
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'Original article URL'
            },
            source: {
              type: 'string',
              enum: ['healthywomen', 'healthcom', 'guardian', 'bbc'],
              description: 'Article source'
            },
            category: {
              type: 'string',
              description: 'Article category/topic'
            },
            image_url: {
              type: 'string',
              format: 'uri',
              description: 'Article thumbnail image'
            },
            published_date: {
              type: 'string',
              format: 'date-time',
              description: 'Publication date'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date added to database'
            }
          }
        },
        Bookmark: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Bookmark ID'
            },
            user_id: {
              type: 'integer',
              description: 'User ID'
            },
            article_id: {
              type: 'integer',
              description: 'Article ID'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Bookmark creation timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error information'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User Authentication And Authorization'
      },
      {
        name: 'Articles',
        description: 'Healthcare Article Management And Retrieval'
      },
      {
        name: 'Bookmarks',
        description: 'User Bookmark Management'
      },
      {
        name: 'Health',
        description: 'Server/System Health And Status Endpoints'
      }
    ]
  },
  apis: ['./server.js', './routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };