export type Person = {
    // Identifiers
    netid?: string;
    upi?: number;
    email?: string;
    mailbox?: string;
    phone?: string;
    fax?: string;
    
    // Naming
    title?: string;
    first_name: string;
    preferred_name?: string;
    middle_name?: string;
    last_name: string;
    suffix?: string;
    pronouns?: string;

    phonetic_name?: string;
    name_recording?: string;

    // Misc
    address?: string;

    // Students
    school_code?: string;
    school?: string;
    year?: number;
    curriculum?: string;
    
    // Undergrads
    college?: string;
    college_code?: string;
    leave?: boolean;
    visitor?: boolean;
    image?: string;
    birthday?: string;
    birth_month?: number;
    birth_day?: number;
    residence?: string;
    building_code?: string;
    entryway?: string;
    floor?: number;
    suite?: number;
    room?: string;
    major?: string;
    access_code?: string;

    // Staff
    organization_code?: string;
    organization?: string;
    unit_class?: string;
    unit_code?: string;
    unit?: string;
    postal_address?: string;
    office_building?: string;
    office_room?: string;
    cv?: string;
    profile?: string;
    website?: string;
    education?: string;
    publications?: string;
};