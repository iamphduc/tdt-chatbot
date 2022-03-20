/* eslint-disable @typescript-eslint/naming-convention */
import { Request, Response } from "express";
import { boundMethod } from "autobind-decorator";

import { PersistentMenuService } from "../services/facebook/persistent-menu.service";
import { SendAPIService } from "../services/facebook/send-api.service";
import { InforService } from "../services/infor/infor.service";
import { HelpMessageService } from "../services/message/help.message.service";
import { TimetableMessageService } from "../services/message/timetable.message.service";
import { ScoreMessageService } from "../services/message/score.message.service";
import { WebhookService } from "../services/webhook/webhook.service";

import logger from "../configs/logger";

export class WebhookController {
  // [GET] /webhook
  @boundMethod
  public connect(req: Request, res: Response) {
    // Your verify token. Should be a random string.
    const { VERIFY_TOKEN } = process.env;

    // Parse the query params
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        logger.info("WEBHOOK_VERIFIED");

        // Set up persistent menu
        const persistentMenuService = new PersistentMenuService();
        persistentMenuService.call();

        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  }

  // [POST] /webhook
  @boundMethod
  public handle(req: Request, res: Response) {
    const { body } = req;

    // Checks this is an event from a page subscription
    if (body.object === "page") {
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach((entry: any) => {
        // Gets the message. entry.messaging is an array, but
        // will only ever contain one message, so we get index 0
        const webhook_event = entry.messaging[0];

        // Get the sender PSID
        const sender_psid = webhook_event.sender.id;

        const sendAPIService = new SendAPIService(sender_psid);
        const inforService = new InforService(sender_psid);
        const helpMessageService = new HelpMessageService(sender_psid);
        const scoreMessageService = new ScoreMessageService(sender_psid);
        const timetableMessageService = new TimetableMessageService(sender_psid);
        const webhookService = new WebhookService(
          sendAPIService,
          inforService,
          helpMessageService,
          scoreMessageService,
          timetableMessageService
        );

        // Check if the event is a message
        if (webhook_event.message) {
          webhookService.handleMessage(webhook_event.message);
          return;
        }

        // Check if the event is a postback
        if (webhook_event.postback) {
          webhookService.handlePostback(webhook_event.postback);
        }
      });

      // Returns a '200 OK' response to all requests
      res.status(200).send("EVENT_RECEIVED");
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  }
}
