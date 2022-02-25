export const seed = async (connection) => {
  await connection.query(
    `INSERT INTO "conference" (name) VALUES ('NestJS Conf')`,
  );

  await connection.query(
    `INSERT INTO "booking" ("firstName", "lastName", email, "phoneNumber", "entryCode", verified, "conferenceId")
      VALUES
        ('John', 'Smith', 'john@mail.com', '+38514833888', 'VV23ZX', false, 1),
        ('Jane', 'Smith', 'jane@mail.com', '+38514833889', 'AAABC1', true, 1)`,
  );
};

export const getBookingByEmail = async (connection, email) => {
  const bookings = await connection.query(
    `SELECT * FROM booking WHERE booking.email = '${email}'`,
  );

  return bookings[0];
};

export const deleteBookingByEmail = async (connection, email) => {
  return await connection.query(
    `DELETE FROM booking WHERE booking.email = '${email}'`,
  );
};

export const insertBooking = async (connection, booking) => {
  const dbResponse = await connection.query(
    `INSERT INTO booking ("firstName", "lastName", email, "phoneNumber", "entryCode", verified, "conferenceId")
      VALUES
        ('${booking.firstName}', '${booking.lastName}', '${booking.email}', '${booking.phoneNumber}', '${booking.entryCode}', ${booking.verified}, ${booking.conferenceId})
      RETURNING id`,
  );
  return dbResponse[0].id;
};
