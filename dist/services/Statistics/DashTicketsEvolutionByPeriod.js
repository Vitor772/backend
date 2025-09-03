"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../database"));
const queryAdmin = `
  select
  dt_ref,
  to_char(dt_ref, 'DD/MM/YYYY') as label,
  qtd
  --ROUND(100.0*(qtd/sum(qtd) over ()), 2) pertentual
  from (
  select
  date_trunc('day', t."createdAt") dt_ref,
  count(1) as qtd
  from "Tickets" t
  INNER JOIN "LogTickets" lt ON lt."ticketId" = t."id"
  where t."companyId" = :companyId
  and (lt."type" LIKE 'open' OR lt."type" LIKE 'receivedTransfer')
  and date_trunc('day', t."createdAt") between :startDate and :endDate
  group by date_trunc('day', t."createdAt")
  ) a
  order by 1
`;
const query = `
  select
  dt_ref,
  to_char(dt_ref, 'DD/MM/YYYY') as label,
  qtd
  --ROUND(100.0*(qtd/sum(qtd) over ()), 2) pertentual
  from (
  select
  date_trunc('day', t."createdAt") dt_ref,
  count(1) as qtd
  from "Tickets" t
  INNER JOIN "LogTickets" lt ON lt."ticketId" = t."id"
  where t."companyId" = :companyId and lt."userId" = :userId
  and (lt."type" LIKE 'open' OR lt."type" LIKE 'receivedTransfer')
  and date_trunc('day', t."createdAt") between :startDate and :endDate
  group by date_trunc('day', t."createdAt")
  ) a
  order by 1
`;
const DashTicketsEvolutionByPeriod = async ({ startDate, endDate, companyId, userId, userProfile }) => {
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
exports.default = DashTicketsEvolutionByPeriod;
