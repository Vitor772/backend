"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../database"));
const query = `
  select label, qtd,  ROUND(100.0*(qtd/sum(qtd) over ()), 2) pertentual from (
  select
  coalesce(q.queue, 'Não informado') as label,
  count(1) as qtd
  from "Tickets" t
  left join "Queues" q on (t."queueId" = q.id)
  where t."companyId" = :companyId AND t."userId" = :userId
  and date_trunc('day', t."createdAt") between :startDate and :endDate
  group by t."queueId", q.queue
  ) a
  order by 2 Desc
`;
const queryAdmin = `
  select label, qtd,  ROUND(100.0*(qtd/sum(qtd) over ()), 2) pertentual from (
  select
  coalesce(q.queue, 'Não informado') as label,
  count(1) as qtd
  from "Tickets" t
  left join "Queues" q on (t."queueId" = q.id)
  where t."companyId" = :companyId
  and date_trunc('day', t."createdAt") between :startDate and :endDate
  group by t."queueId", q.queue
  ) a
  order by 2 Desc
`;
const DashTicketsQueue = async ({ startDate, endDate, companyId, userId, userProfile }) => {
    const data = await database_1.default.query(userProfile == "admin" ? queryAdmin : query, {
        replacements: {
            companyId,
            startDate,
            endDate,
            userId
        },
        type: sequelize_1.QueryTypes.SELECT
        // logging: console.log
    });
    return data;
};
exports.default = DashTicketsQueue;
