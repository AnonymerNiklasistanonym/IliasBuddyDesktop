import { IliasBuddyRawEntryParser } from '../PARSER/RawEntryParserTypes'

export interface RenderEntry extends IliasBuddyRawEntryParser.Entry {
    hasDescription: boolean;
    hasCourseDirectory: boolean;
}
