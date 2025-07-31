export function passwordRecoveryTemplate(code) {
  return `
    <html>
    <head>
      <style>
        body { background-color: #F6FAF9; margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .header { background-color: #BF334D; color: #ffffff; padding: 10px; text-align: center; }
        .content { margin: 20px 0; color: #333333; text-align: center; }
        .code { display: block; background-color: #ffffff; border: 2px dashed #BF334D; color: #BF334D; font-size: 1.2em; text-align: center; padding: 10px; margin: 20px auto; border-radius: 4px; width: fit-content; }
        .footer { font-size: 0.9em; color: #777777; text-align: center; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header"><h1>FoodSpot | Password Recovery</h1></div>
      <div class="content">
        <p>Please use the code below to reset your password:</p>
        <span class="code">\${code}</span>
        <p>If you didn’t request this, simply ignore this email.</p>
      </div>
    </body>
    </html>
  `;
}

export function newEventTemplate(eventId) {
  return `
    <html>
    <head>
      <style>
        body { background-color: #F6FAF9; margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .header { background-color: #BF334D; color: #ffffff; padding: 10px; text-align: center; }
        .content { margin: 20px 0; color: #333333; text-align: center; }
        .button { display: block; background-color: #BF334D; color: #ffffff; padding: 10px 16px; text-decoration: none; border-radius: 4px; width: fit-content; margin: 20px auto; }
      </style>
    </head>
    <body>
      <div class="header"><h1>FoodSpot | New Event</h1></div>
      <div class="content">
        <p>A new event has been created. Click below to view:</p>
        <a class="button" href="https://food-spot.vercel.app/event/\${eventId}">View Event</a>
      </div>
    </body>
    </html>
  `;
}

export function eventStartTemplate(eventId) {
  return `
    <html>
    <head>
      <style>
        body { background-color: #F6FAF9; margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .header { background-color: #BF334D; color: #ffffff; padding: 10px; text-align: center; }
        .content { margin: 20px 0; color: #333333; text-align: center; }
        .button { display: block; background-color: #BF334D; color: #ffffff; padding: 10px 16px; text-decoration: none; border-radius: 4px; width: fit-content; margin: 20px auto; }
      </style>
    </head>
    <body>
      <div class="header"><h1>FoodSpot | Event Starting Soon</h1></div>
      <div class="content">
        <p>Your event is about to begin. Click below to join:</p>
        <a class="button" href="https://food-spot.vercel.app/event/\${eventId}">Join Event</a>
      </div>
    </body>
    </html>
  `;
}

export function penalizationStartTemplate(eventId, penalization) {
  return `
    <html>
    <head>
      <style>
        body { background-color: #F6FAF9; margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .header { background-color: #BF334D; color: #ffffff; padding: 10px; text-align: center; }
        .content { margin: 20px 0; color: #333333; text-align: center; }
        .highlight { color: #BF334D; font-weight: bold; display: block; margin: 10px auto; }
        .button { display: block; background-color: #BF334D; color: #ffffff; padding: 10px 16px; text-decoration: none; border-radius: 4px; width: fit-content; margin: 20px auto; }
      </style>
    </head>
    <body>
      <div class="header"><h1>FoodSpot | Penalization Starts Today</h1></div>
      <div class="content">
        <p>A fee of <span class="highlight">$\${event.penalization} per day</span> has begun on your event balance.</p>
        <p>Please settle your amount:</p>
        <a class="button" href="https://food-spot.vercel.app/event/\${eventId}">View Details</a>
      </div>
    </body>
    </html>
  `;
}

export function penalizationOneWeekTemplate(eventId, penalization) {
  return `
    <html>
    <head>
      <style>
        body { background-color: #F6FAF9; margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .header { background-color: #BF334D; color: #ffffff; padding: 10px; text-align: center; }
        .content { margin: 20px 0; color: #333333; text-align: center; }
        .highlight { color: #BF334D; font-weight: bold; display: block; margin: 10px auto; }
        .button { display: block; background-color: #BF334D; color: #ffffff; padding: 10px 16px; text-decoration: none; border-radius: 4px; width: fit-content; margin: 20px auto; }
      </style>
    </head>
    <body>
      <div class="header"><h1>FoodSpot | 1 Week of Penalization</h1></div>
      <div class="content">
        <p>Penalization of <span class="highlight">$\${event.penalization} per day</span>has been applied for one week.</p>
        <p>Please review and clear your balance:</p>
        <a class="button" href="https://food-spot.vercel.app/event/\${eventId}">View Event</a>
      </div>
    </body>
    </html>
  `;
}
