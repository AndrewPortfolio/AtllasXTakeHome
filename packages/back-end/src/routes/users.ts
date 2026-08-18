import { Router } from 'express';
import { col, fn, UniqueConstraintError, ValidationError, where } from 'sequelize';
import { parsePaginationQuery, toCreateUserAttributes, validateUserForm } from 'shared';
import IRoute from '../types/IRoute';
import { User } from '../services/db';

const DUPLICATE_EMAIL_RESPONSE = {
  success: false,
  error: 'A user with that email address already exists.',
  fields: { email: 'This email is already registered.' },
} as const;

const UsersRouter: IRoute = {
  route: '/users',
  router() {
    const router = Router();

    router.route('/')
      // Fetch one page of users
      .get(async (req, res) => {

        const pagination = parsePaginationQuery(req.query);

        if (pagination.status === 'invalid') {
          return res.status(400).json({
            success: false,
            error: pagination.message,
          });
        }

        const { offset, limit } = pagination.values;

        try {
          const [rows, total] = await Promise.all([
            // Ordered by primary key so page boundary falls in same place
            // without SQlite can reorder so we see data twice or not at all
            // One row over the limit answers `hasMore` without a second round trip.
            User.findAll({ order: [['id', 'ASC']], offset, limit: limit + 1 }),
            User.count(),
          ]);

          const hasMore = rows.length > limit;

          return res.json({
            success: true,
            data: {
              users: hasMore ? rows.slice(0, limit) : rows,
              offset,
              limit,
              hasMore,
              total,
            },
          });
        } catch (err) {
          console.error('Failed to list users.', err);

          return res.status(500).json({
            success: false,
            error: 'Could not load users. Please try again.',
          });
        }
      })

      // Create a new user
      .post(async (req, res) => {
        const parsed = validateUserForm(req.body);

        if (parsed.status === 'invalid') {
          return res.status(400).json({
            success: false,
            error: parsed.message,
            fields: parsed.fields,
          });
        }

        const attributes = toCreateUserAttributes(parsed.values);

        try {
          // The unique index is case-sensitive make all emails lowercase
          // check if exists before inserting --> avoids dups 
          const existing = await User.findOne({
            attributes: ['id'],
            where: where(fn('lower', col('email')), attributes.email.toLowerCase()),
          });

          if (existing) {
            return res.status(409).json(DUPLICATE_EMAIL_RESPONSE);
          }

          const created = await User.create(attributes);

          return res.status(201).json({
            success: true,
            data: created,
          });
        } catch (err) {
          // duplicate email error
          if (err instanceof UniqueConstraintError) {
            return res.status(409).json(DUPLICATE_EMAIL_RESPONSE);
          }

          // Error if certain fields are missing
          if (err instanceof ValidationError) {
            return res.status(400).json({
              success: false,
              error: 'Some fields need your attention.',
              fields: Object.fromEntries(err.errors.map(item => [item.path, item.message])),
            });
          }

          console.error('Failed to create a user.', err);

          return res.status(500).json({
            success: false,
            error: 'Could not save the user. Please try again.',
          });
        }
      })
    ;

    return router;
  },
};

export default UsersRouter;
