import { IliasBuddyRawEntryParser } from "../PARSER/RawEntryParserTypes";

/**
 * Extends the normal entry with helpful properties for an easy rendering with
 * handlebars templates
 */
export interface RenderEntry extends IliasBuddyRawEntryParser.Entry {
    /**
     * Helper: If true means the description is not empty
     */
    hasDescription: boolean;
    /**
     * Helper: If true means the entry has a course directory that is not an
     * empty list
     */
    hasCourseDirectory: boolean;
}
