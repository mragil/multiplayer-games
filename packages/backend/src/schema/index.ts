import { z } from "zod";
import { Pick } from "../type";

const gamePickSchema = z.custom<Pick>();

export { gamePickSchema };
