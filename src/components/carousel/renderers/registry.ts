"use client";

import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { SlideRenderProps } from "../template-primitives";
import { Tahrir } from "./tahrir";
import { Wadeh } from "./wadeh";
import { Noqta } from "./noqta";
import { Itar } from "./itar";
import { Mujaz } from "./mujaz";
import { Academy } from "./academy";
import { Hadith } from "./hadith";
import { Tabayun } from "./tabayun";
import { Shabaka } from "./shabaka";
import { Hero } from "./hero";
import { Editorial } from "./editorial";
import { Split } from "./split";
import { Stacked } from "./stacked";
import { Cards } from "./cards";
import { Rotated } from "./rotated";
import { Terminal } from "./terminal";
import { Magazine } from "./magazine";
import { Tilt } from "./tilt";
import { Retro } from "./retro";
import { Unwan } from "./unwan";
import { ClinicalClean } from "./clinical-clean";
import { NumberedSteps } from "./numbered-steps";
import { MythFact } from "./myth-fact";
import { EditorialHealth } from "./editorial-health";
import { BoldStatement } from "./bold-statement";
import { Tahdheer } from "./tahdheer";
import { Raqmi } from "./raqmi";
import { Engineering } from "./engineering";
import { Flow } from "./flow";
import { Laqta } from "./laqta";
import { Vibrant } from "./vibrant";

export type TemplateRenderer = ForwardRefExoticComponent<
  SlideRenderProps & RefAttributes<HTMLDivElement>
>;

export const RENDERER_REGISTRY: Record<string, TemplateRenderer> = {
  tahrir: Tahrir,
  wadeh: Wadeh,
  noqta: Noqta,
  itar: Itar,
  mujaz: Mujaz,
  academy: Academy,
  hadith: Hadith,
  tabayun: Tabayun,
  shabaka: Shabaka,
  hero: Hero,
  editorial: Editorial,
  split: Split,
  stacked: Stacked,
  cards: Cards,
  rotated: Rotated,
  terminal: Terminal,
  magazine: Magazine,
  tilt: Tilt,
  retro: Retro,
  unwan: Unwan,
  "clinical-clean": ClinicalClean,
  "numbered-steps": NumberedSteps,
  "myth-fact": MythFact,
  "editorial-health": EditorialHealth,
  "bold-statement": BoldStatement,
  tahdheer: Tahdheer,
  raqmi: Raqmi,
  engineering: Engineering,
  flow: Flow,
  laqta: Laqta,
  vibrant: Vibrant,
};
