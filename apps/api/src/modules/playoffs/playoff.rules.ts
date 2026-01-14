export type PlayoffStage = | 'QUALIFIER' | 'ELIMINATOR' | 'QUALIFIER_2' | 'SEMI_FINAL' | 'FINAL';

export type StandardRuleMap = {
    SEMI_FINAL: 'FINAL';
};

export type IplRuleMap = {
    QUALIFIER: {
        winner: 'FINAL';
        loser: 'QUALIFIER_2';
    };
    ELIMINATOR: {
        winner: 'QUALIFIER_2';
    };
    QUALIFIER_2: {
        winner: 'FINAL';
    };
};

export const NEXT_STAGE_RULES: {
    STANDARD: StandardRuleMap;
    IPL: IplRuleMap;
} = {
    STANDARD: {
        SEMI_FINAL: 'FINAL',
    },
    IPL: {
        QUALIFIER: {
            winner: 'FINAL',
            loser: 'QUALIFIER_2',
        },
        ELIMINATOR: {
            winner: 'QUALIFIER_2',
        },
        QUALIFIER_2: {
            winner: 'FINAL',
        },
    },
};
