import { faker, Sex } from '@faker-js/faker';
import { User } from 'back-end/src/services/db';

const isFull = process.argv.includes('--full');

(async () => {
  console.log('Creating tables...');
  await User.sync({ force: true });

  const numToGenerate = isFull ? 5_000 : 1_000;

  const ops = [];

  console.log('Generating data...');
  for (let i = 0; i < numToGenerate; i++) {
    const _sex = Math.random() < 0.5 ? Sex.Female : Sex.Male;
    const firstName = faker.name.firstName(_sex);
    const middleName = Math.random() < 0.75 ? faker.name.middleName(_sex) : undefined;
    const lastName = faker.name.lastName(_sex);
    const _addrState = faker.address.stateAbbr();

    ops.push({
      registered: faker.date.recent(Math.random() * 1e3 >> 0),
      firstName,
      middleName,
      lastName,
      email: faker.internet.email((Math.random() * 2e9 >> 0).toString(36), (Math.random() * 2e9 >> 0).toString(36)),
      phoneNumber: Math.random() < 0.4 ? faker.phone.number('+1 (###) ###-####') : undefined,
      address: Math.random() > 0.9 ? undefined : [
        faker.address.streetAddress(Math.random() < 0.3),
        faker.address.city(),
        _addrState,
        faker.address.zipCodeByState(_addrState),
      ].join(', '),
      adminNotes: Math.random() < 0.1 ? faker.lorem.sentences(1) : undefined,
    });
  }

  console.log('Generated %d chunks. Processing...', Math.ceil(ops.length / 100));
  let chunkNum = 0;
  while (ops.length) {
    const chunk = ops.splice(0, 100);
    await User.bulkCreate(chunk);
    console.log('Finished chunk %d', ++chunkNum);
  }

  const rejections = await Promise.allSettled(ops)
    .then(results => (
      results
        .filter(res => res.status === 'rejected')
        .map((result: PromiseRejectedResult) => result.reason)
    ));

  if (rejections.length > 0) {
    console.error('One or more insertion operations failed!\n', rejections);
    process.exit(1);
  } else {
    console.log('DB seeded.');
  }
})();
