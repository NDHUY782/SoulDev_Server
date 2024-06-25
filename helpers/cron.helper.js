const dayjs = require("dayjs");
const NotificationController = require("../controller/notificationController");
const TournamentSchema = require("../models/TournamentSchema");
const TravelSchema = require("../models/TravelSchema");
const EventSchema = require("../models/EventSchema");
const RewardSchema = require("../models/RewardSchema");
const { sendEmailSendGrid } = require("../helper/mail.helper");
const TournamentMediaDriveSchema = require("../models/TournamentMediasDriveSchema");
const TournamentMediaSchema = require("../models/TournamentMediaSchema");
const driveHelper = require("../helper/drive.helper");

// const syncDriveLink = async (req) => {
//   try {
//     const driveLink = await TournamentMediaDriveSchema.find({});

//     for (const drive of driveLink) {
//       if (drive.sync === true) {
//         const driveImages = [];
//         const link = drive.name;
//         const imageLinks = link.split("\n");
//         for (const driveLink of imageLinks) {
//           if (driveLink.includes("drive.google")) {
//             try {
//               if (driveLink.includes("/file/d/")) {
//                 continue;
//                 // const fileObject = await driveHelper.convertToFilesObject(
//                 //   driveLink.trim()
//                 // );
//                 // driveImages.push(fileObject);
//               } else if (driveLink.includes("/drive/folders/")) {
//                 const filesData = { fileId: driveLink.trim() };
//                 const fileObjects =
//                   await driveHelper.convertFolderToFilesObject(filesData);
//                 for (const fileObject of fileObjects) {
//                   driveImages.push(fileObject);
//                 }
//               }
//             } catch (error) {
//               console.error("Error processing image from Google Drive:", error);
//               return res.status(500).send({
//                 message: res.__("Error processing image from Google Drive"),
//                 success: false,
//               });
//             }
//           } else {
//             // If the link is not from Google Drive
//             return res.status(200).send({
//               message: res.__("Invalid Google Drive link detected"),
//               success: false,
//             });
//           }
//         }
//         // drive.images = driveImages;
//         // if (driveImages.length != drive.count) {
//         //   drive.count = driveImages.length;
//         //   await TournamentMediaSchema.deleteMany({
//         //     drive_id: drive._id,
//         //   });
//         //   driveHelper.processLink(drive);
//         // }

//         //compare the original images and the new images that have been updated, in images array each image object has a unique id, compare and filter out the existed images, then add the new images to the existed images array
//         const existedImages = await TournamentMediaSchema.find({
//           drive_id: drive._id,
//         });
//         const existedImagesId = existedImages.map((image) => image.id);
//         const newImages = driveImages.filter(
//           (image) => !existedImagesId.includes(image.id)
//         );
//         const images = existedImages.concat(newImages);
//         drive.images = images;
//         drive.count = images.length;
//         await drive.save();
//         await driveHelper.processLink(drive);
//       }
//     }
//   } catch (error) {
//     console.error("Error syncing Google Drive link:", error);
//     return res.status(500).send({
//       message: res.__("Error syncing Google Drive link"),
//       success: false,
//     });
//   }
// };

const sendNotificationForUpcomingTournaments = async (req) => {
  // Add the req parameter to access user information
  try {
    // Get all tournaments with players' details
    const tournaments = await TournamentSchema.find({})
      .populate({
        path: "players",
        populate: {
          path: "customer_id",
          select: "first_name last_name name hdc_num image city_id",
          populate: {
            path: "city_id",
            select: "name",
          },
        },
      })
      .sort({ start_date: -1 });

    // Get the current date and the date one day from now
    const currentDate = dayjs();
    const tomorrow = currentDate.add(1, "day");

    // Iterate through tournaments and check for upcoming ones
    for (const tournament of tournaments) {
      if (
        tournament.start_date &&
        dayjs(tournament.start_date).isAfter(currentDate) &&
        dayjs(tournament.start_date).isBefore(tomorrow)
      ) {
        // Check if the user is registered in the tournament and has "APPROVED" status
        const userIsRegistered = tournament.players.some(
          (player) =>
            player.customer_id?._id?.toString() === req?.user?._id &&
            player.status === "APPROVED",
        );

        if (userIsRegistered) {
          await NotificationController._sendOne({
            title: "Your Tournament is about to begin",
            contents: `Your ${tournament.name} tournament begins tomorrow`,
            subtitle: "",
            customer: req?.user?._id,
            data: {
              route: "TournamentDetail",
            },
            type: "tournament",
          });
        }
      }
    }
  } catch (err) {
    console.error("Error sending notifications:", err);
  }
};

const sendNotificationForUpcomingTravels = async (req) => {
  // Add the req parameter to access user information
  try {
    // Get all travels with customers' details
    const travels = await TravelSchema.find({})
      .populate({
        path: "customers",
        populate: {
          path: "customer_id",
          select: "first_name last_name avatar email phone_number",
        },
        select: "status",
      })
      .sort({ start_date: -1 });

    // Get the current date and the date one day from now
    const currentDate = dayjs();
    const tomorrow = currentDate.add(1, "day");

    // Iterate through travels and check for upcoming ones
    for (const travel of travels) {
      if (
        travel.start_date &&
        dayjs(travel.start_date).isAfter(currentDate) &&
        dayjs(travel.start_date).isBefore(tomorrow)
      ) {
        // Check if the user is registered in the travel and has "APPROVED" status
        const userIsRegistered = travel.customers.some(
          (customer) =>
            customer.customer_id?._id?.toString() === req?.user?._id &&
            customer.status === "APPROVED",
        );

        if (userIsRegistered) {
          await NotificationController._sendOne({
            title: "Your Travel is about to begin",
            contents: `Your ${travel.name} travel begins tomorrow`,
            subtitle: "",
            customer: req?.user?._id,
            data: {
              route: "TravelDetail",
            },
            type: "travel",
          });
        }
      }
    }
  } catch (err) {
    console.error("Error sending notifications:", err);
  }
};

const sendNotificationForUpcomingEvents = async (req) => {
  try {
    // Get all events with customers' details
    const events = await EventSchema.find({})
      .populate({
        path: "customers",
        populate: {
          path: "customer_id",
          select: "first_name last_name avatar email phone_number",
        },
        select: "status",
      })
      .sort({ start_date: -1 });

    // Get the current date and the date one day from now
    const currentDate = dayjs();
    const tomorrow = currentDate.add(1, "day");

    // Iterate through events and check for upcoming ones
    for (const event of events) {
      if (
        event.start_date &&
        dayjs(event.start_date).isAfter(currentDate) &&
        dayjs(event.start_date).isBefore(tomorrow)
      ) {
        // Check if the user is registered in the event and has "APPROVED" status
        const userIsRegistered = event.customers.some(
          (customer) =>
            customer.customer_id?._id?.toString() === req?.user?._id &&
            customer.status === "APPROVED",
        );

        if (userIsRegistered) {
          await NotificationController._sendOne({
            title: "Your Event is about to begin",
            contents: `Your ${event.name} event begins tomorrow`,
            subtitle: "",
            customer: req?.user?._id,
            data: {
              route: "EventDetail", // Replace with the correct route for your event detail page
            },
            type: "event",
          });
        }
      }
    }
  } catch (err) {
    console.error("Error sending notifications:", err);
  }
};

const sendNotificationForUpcomingExpiredRewards = async () => {
  try {
    // Get all rewards with customers' details
    const rewards = await RewardSchema.find({})
      .populate({
        path: "customers",
        populate: {
          path: "customer_id",
          select: "first_name last_name avatar email phone_number",
        },
        select: "status",
      })
      .sort({ end_date: -1 });

    // Get the current date and the date one day from now
    const currentDate = dayjs();
    const tomorrow = currentDate.add(1, "day");

    // Iterate through rewards and check for upcoming ones
    for (const reward of rewards) {
      if (
        reward.end_date &&
        dayjs(reward.end_date).isAfter(currentDate) &&
        dayjs(reward.end_date).isBefore(tomorrow) &&
        reward.status === "REGISTERING"
      ) {
        // Check if the user is registered in the reward and has "APPROVED" status
        const userIsRegistered = reward.customers.some(
          (customer) => customer.status === "APPROVED",
        );

        if (userIsRegistered) {
          await NotificationController._sendOne({
            title: "Your Reward is about to expire",
            contents: `Your ${reward.name} reward expires tomorrow`,
            subtitle: "",
            customer: req?.user?._id,
            data: {
              route: "RewardDetail", // Replace with the correct route for your reward detail page
            },
            type: "reward",
          });
        }
      }
    }
  } catch (err) {
    console.error("Error sending notifications:", err);
  }
};

const sendNotificationForExpiredRewards = async () => {
  try {
    // Get all rewards with customers' details
    const rewards = await RewardSchema.find({})
      .populate({
        path: "customers",
        populate: {
          path: "customer_id",
          select: "first_name last_name avatar email phone_number",
        },
        select: "status",
      })
      .sort({ end_date: -1 });

    // Get the current date
    const currentDate = dayjs();

    // Iterate through rewards and check for expired ones
    for (const reward of rewards) {
      if (
        reward.end_date &&
        dayjs(reward.end_date).isBefore(currentDate) &&
        reward.status === "REGISTERING"
      ) {
        // Check if the user is registered in the reward and has "APPROVED" status
        const userIsRegistered = reward.customers.some(
          (customer) => customer.status === "APPROVED",
        );

        if (userIsRegistered) {
          await NotificationController._sendOne({
            title: "Your Reward has expired",
            contents: `Your ${reward.name} reward has expired`,
            subtitle: "",
            customer: req?.user?._id,
            data: {
              route: "RewardDetail", // Replace with the correct route for your reward detail page
            },
            type: "reward",
          });
        }
      }
    }
  } catch (err) {
    console.error("Error sending notifications:", err);
  }
};

module.exports = {
  // syncDriveLink,
  sendNotificationForUpcomingTournaments,
  sendNotificationForUpcomingTravels,
  sendNotificationForUpcomingEvents,
  sendNotificationForExpiredRewards,
  sendNotificationForUpcomingExpiredRewards,
};
