/**
 * Sidebar contents for the three sections that share `SectionLayout`.
 *
 * Every link here stays inside its own section — the rule that keeps the
 * sidebar on screen after a click. A link to another section (say, the
 * troubleshooting page pointing at `omm doctor`) belongs in the page body.
 */

import { getCommandLinks } from '../components/commands/commands';
import { getGuideLinks } from '../components/install/guides';
import { COMMAND_GROUPS, COMMAND_ORDER } from '../i18n/commands/base';
import type { Locale } from '../i18n/config';
import { getDictionary } from '../i18n/dictionaries';
import { getSiteCopy } from '../i18n/site';
import { getUseCases } from '../i18n/use-cases';
import { topLevelEntries } from './commands/reference';
import { navigationGroup, type ShellSection } from './site-navigation';

export type MenuLink = { href: string; label: string; tag?: string; mono?: boolean };
export type MenuGroup = { title?: string; links: MenuLink[] };
/** `collapsible`: groups fold to their titles and only one is open at a time. */
export type SectionMenu = { title: string; href: string; groups: MenuGroup[]; collapsible?: boolean };

function docsMenu(locale: Locale): SectionMenu {
  const t = getSiteCopy(locale);
  const installGuides: MenuLink[] = getGuideLinks(locale).map((link) => ({ href: link.href, label: link.os }));
  const groups = t.docsSections.map((section) => {
    const links: MenuLink[] = section.links
      .filter((link) => navigationGroup(link.href) === 'docs')
      .map((link) => ({ href: link.href, label: link.label, tag: link.english ? t.englishTag : undefined }));
    // The OS guides live under /install, so they sit beside the install link.
    const at = links.findIndex((link) => link.href === '/install');
    if (at >= 0) links.splice(at + 1, 0, ...installGuides);
    return { title: section.title, links };
  }).filter((group) => group.links.length > 0);
  return { title: t.docsMenu, href: '/docs', groups };
}

function guidesMenu(locale: Locale): SectionMenu {
  const t = getSiteCopy(locale);
  return {
    title: t.chooseUseCase,
    href: '/use-cases',
    groups: [{ links: getUseCases(locale).map((guide) => ({ href: `/use-cases/${guide.slug}`, label: guide.title })) }],
  };
}

function commandsMenu(locale: Locale): SectionMenu {
  const { commandsChooser } = getDictionary(locale);
  const links = getCommandLinks(locale);
  const written = new Set<string>(COMMAND_ORDER);
  const groups: MenuGroup[] = COMMAND_GROUPS.map((group) => ({
    title: commandsChooser.groups[group],
    links: links.filter((link) => link.group === group).map((link) => ({ href: link.href, label: link.slug, mono: true })),
  }));
  const reference = topLevelEntries().filter((entry) => !written.has(entry.path[0]));
  if (reference.length > 0) {
    groups.push({
      title: commandsChooser.reference.title,
      links: reference.map((entry) => ({ href: `/commands/${entry.path[0]}`, label: entry.path[0], mono: true })),
    });
  }
  return { title: commandsChooser.label, href: '/commands', groups, collapsible: true };
}

export function sectionMenu(section: ShellSection, locale: Locale): SectionMenu {
  if (section === 'docs') return docsMenu(locale);
  if (section === 'use-cases') return guidesMenu(locale);
  return commandsMenu(locale);
}
