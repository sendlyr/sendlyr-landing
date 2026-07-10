function maintenanceOptions(args = process.argv.slice(2), env = process.env) {
  const apply = args.includes("--apply");
  const confirmProduction = args.includes("--confirm-production");
  const production = env.ANALYTICS_ENV === "production";
  if (apply && production && !confirmProduction) throw new Error("Production writes require --confirm-production.");
  return { apply, confirmProduction, production };
}

function idsFilter(column, ids) {
  if (!/^[a-z_]+$/.test(column) || !ids.length || ids.some((id) => !/^[a-zA-Z0-9-]+$/.test(id))) throw new Error("Unsafe maintenance identifier.");
  return `${column}=in.(${ids.join(",")})`;
}

function dateRangeArgs(args = process.argv.slice(2)) {
  const from = args.find((value) => value.startsWith("--from="))?.slice(7);
  const to = args.find((value) => value.startsWith("--to="))?.slice(5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from || "") || !/^\d{4}-\d{2}-\d{2}$/.test(to || "") || from >= to) {
    throw new Error("Provide a complete range: --from=YYYY-MM-DD --to=YYYY-MM-DD.");
  }
  return { from, to };
}

module.exports = { dateRangeArgs, idsFilter, maintenanceOptions };
