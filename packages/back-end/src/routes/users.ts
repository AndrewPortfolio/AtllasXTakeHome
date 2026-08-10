import { Router } from 'express';
import { col, fn, UniqueConstraintError, ValidationError, where } from 'sequelize';
import { toCreateUserAttributes, validateUserForm } from 'shared';
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
      // Fetch all users
      .get(async (req, res) => {
        // pro tip: if you're not seeing any users, make sure you seeded the database.
        //          make sure you read the readme! :)

        return User.findAll()
          .then(users => {
            return res.json({
              success: true,
              data: users,
            });
          })
          .catch(err => {
            console.error('Failed to list all users.', err);
            res.status(500).json({
              success: false,
            });
          });
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
          // The unique index is case-sensitive, but "Ada@x.com" and "ada@x.com" are the same
          // mailbox as far as the POs are concerned. Check before inserting so the caller gets
          // a helpful 409 rather than a surprise duplicate row.
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
          // Lost the race against a concurrent insert with the same email.
          if (err instanceof UniqueConstraintError) {
            return res.status(409).json(DUPLICATE_EMAIL_RESPONSE);
          }

          // Model-level constraints we didn't catch above (NOT NULL, length, ...).
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
