"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
const sequelize_1 = require("sequelize");
const _ = __importStar(require("lodash"));
const database_1 = __importDefault(require("../../database"));
async function DashboardDataService(companyId, params) {
    const query = `   with traking as
                           (select c.name                                                                    "companyName",
                                   u.name                                                                    "userName",
                                   u.online                                                                  "userOnline",
                                   w.name                                                                    "whatsappName",
                                   ct.name                                                                   "contactName",
                                   ct.number                                                                 "contactNumber",
                                   (t."status" = 'closed')                                                   "finished",
                                   (tt."userId" is null and tt."finishedAt" is null and
                                    t."status" = 'pending')                                                  "pending",
                                   coalesce(((date_part('day', age(tt."finishedAt")) * 24 * 60) +
                                             (date_part('hour', age(tt."finishedAt", tt."startedAt")) * 60) +
                                             (date_part('minutes', age(tt."finishedAt", tt."startedAt")))),
                                            0)                                                               "supportTime",
                                   coalesce(((date_part('day', age(tt."queuedAt", tt."startedAt")) * 24 * 60) +
                                             (date_part('hour', age(tt."queuedAt", tt."startedAt")) * 60) +
                                             (date_part('minutes', age(tt."queuedAt", tt."startedAt")))), 0) "waitTime",
                                   t.status,
                                   tt.*,
                                   ct."id"                                                                   "contactId"
                            from "TicketTraking" tt
                                   left join "Companies" c on c.id = tt."companyId"
                                   left join "Users" u on u.id = tt."userId"
                                   left join "Whatsapps" w on w.id = tt."whatsappId"
                                   left join "Tickets" t on t.id = tt."ticketId"
                                   left join "Contacts" ct on ct.id = t."contactId" --filterPeriod),
                         counters
                           as (select (select avg("supportTime") from traking where "supportTime" > 0) "avgSupportTime",
                                      (select avg("waitTime") from traking where "waitTime" > 0)       "avgWaitTime",
                                      (select count(distinct "id")
                                       from "Tickets" t
                                       where status like 'open'
                                         and t."companyId" = ?)                                        "supportHappening",

                                      (select count(distinct "id")
                                       from "Tickets" t
                                       where status like 'pending' and t."companyId" = ?)              "supportPending",
                                      (select count(id) from traking where finished)                   "supportFinished",
                                      (select count(leads.id)
                                       from (select ct1.id, count(tt1.id) total
                                             from traking tt1
                                                    left join "Tickets" t1 on t1.id = tt1."ticketId"
                                                    left join "Contacts" ct1 on ct1.id = t1."contactId"
                                             group by 1
                                             having count(tt1.id) = 1) leads)                          "leads",
                                      (select count(id) from traking where "status" = 'closed')        "tickets",
                                      (select count(id) from traking where "status" = 'closed' and "rated" = false)           "waitRating",
                                      (select count(tt.id)
                                       from traking tt
                                              inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                       where "status" = 'closed' and ("rated" = false and "rate" = 0))                  "withoutRating",
                                      (select count(id)
                                       from traking
                                       where "rated" = true)                   "withRating",
                                      (((select count(id) from traking where "rated" = true) * 100) /
                                       nullif((select count(id) from traking), 0))                     "percRating",
                                      (select (100 * count(tt.*)) / NULLIF((select count(*) total
                                                                            from traking tt
                                                                                   inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                                                            where rated = true), 0)
                                       from traking tt
                                              inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                       where tt.rated = true
                                         and ur."rate" > 3)                                            "npsPromotersPerc",
                                      (select (100 * count(tt.*)) / NULLIF((select count(*) total
                                                                            from traking tt
                                                                                   inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                                                            where rated = true), 0)
                                       from traking tt
                                              inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                       where tt.rated = true
                                         and ur."rate" = 3)                                      "npsPassivePerc",
                                      (select (100 * count(tt.*)) / NULLIF((select count(*) total
                                                                            from traking tt
                                                                                   inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                                                            where rated = true), 0)
                                       from traking tt
                                              inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                       where tt.rated = true
                                         and ur."rate" < 3 and ur."rate" != 0)                                            "npsDetractorsPerc",
                                      (select sum(nps.promoter) - sum(nps.detractor)
                                       from ( (select (100 * count(tt.*)) / NULLIF((select count(*) total
                                                                                    from traking tt
                                                                                           inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                                                                    where rated = true), 0) promoter,
                                                      0                                                     detractor
                                               from traking tt
                                                      inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                               where tt.rated = true
                                                 and ur."rate" >= 3
                                               union
                                               select 0,
                                                      (100 * count(tt.*)) / NULLIF((select count(*) total
                                                                                    from traking tt
                                                                                           inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                                                                    where rated = true), 0)
                                               from traking tt
                                                      inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                                               where tt.rated = true
                                                 and ur.rate < 3 and ur.rate != 0)) nps)                                "npsScore"),
                         attedants as (select u1.id,
                                              u1."name",
                                              u1."online",
                                              avg(t."waitTime")                     "avgWaitTime",
                                              avg(t."supportTime")                  "avgSupportTime",
                                              count(t."id")                         "tickets",
                                              round(coalesce(avg(ur."rate"), 0), 2) "rating",
                                              coalesce(count(ur."id"), 0)           "countRating"
                                       from "Users" u1
                                              left join traking t on t."userId" = u1.id
                                              left join "UserRatings" ur
                                                        on ur."userId" = t."userId" and ur."ticketId" = t."ticketId"
                                       where u1."companyId" = ?
                                       group by 1, 2
                                       order by u1."name")
                    select (select coalesce(jsonb_build_object('counters', c.*) ->> 'counters', '{}') ::jsonb
                            from counters c)                                               counters,
                           (select coalesce(json_agg(a.*), '[]') ::jsonb from attedants a) attendants; `;
    let where = "where tt.\"companyId\" = ?";
    const replacements = [companyId];
    if (_.has(params, "days")) {
        where += " and tt.\"createdAt\" >= (now() - '? days'::interval)";
        replacements.push(parseInt(("" + params.days).replace(/\D/g, ""), 10));
    }
    if (_.has(params, "date_from")) {
        where += " and tt.\"createdAt\" >= ?";
        replacements.push(params.date_from + " 00:00:00");
    }
    if (_.has(params, "date_to")) {
        where += " and tt.\"createdAt\" <= ?";
        replacements.push(params.date_to + " 23:59:59");
    }
    replacements.push(companyId);
    replacements.push(companyId);
    replacements.push(companyId);
    const finalQuery = query.replace("--filterPeriod", where);
    const responseData = await database_1.default.query(finalQuery, {
        replacements,
        type: sequelize_1.QueryTypes.SELECT,
        plain: true
    });
    return responseData;
}
exports.default = DashboardDataService;
