import { IliasBuddyApi } from '../API/IliasBuddyTypes'

export interface RenderEntry extends IliasBuddyApi.Entry {
    hasDescription: boolean;
    hasCourseDirectory: boolean;
}
