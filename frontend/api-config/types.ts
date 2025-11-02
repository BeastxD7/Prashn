export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data: T | null;
}


// ------------------ User related types --------------------------


export interface UserRegisterPayload {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	password: string;
}

export interface UserResponse {
	status: boolean;
	message: string;
	user?: unknown;
}

export interface UserLoginPayload {
	username: string;
	password: string;
}

export interface ResetPasswordPayload {
	token: string;
	password: string;
	confirmPassword: string;
}

export interface meResponse {
	status: boolean;
	message?: string;
	user: any;
}


// ------------------ Dashboard / Features --------------------------


export interface FeatureTier {
	maxQuestions: number;
	credits: number;
}

export interface FeatureItem {
	id: string;
	title: string;
	description?: string;
	route: string;
	tiers: FeatureTier[];
}

export interface DashboardData {
	credits: number;
	features: FeatureItem[];
}

export const DIFFICULTY_VALUES = ["easy", "medium", "hard"] as const;

export type DifficultyLevel = (typeof DIFFICULTY_VALUES)[number];

export const QUESTION_TYPE_VALUES = [
	"MCQ",
	"SHORT_ANSWER",
	"TRUE_FALSE",
	"FILL_IN_THE_BLANK",
	"MATCHING",
	"ESSAY",
	"ORDERING",
] as const;

export type QuestionType = (typeof QUESTION_TYPE_VALUES)[number];

export interface GenerateQuizPreferences {
	numOfQuestions?: number;
	difficulty?: DifficultyLevel;
	questionTypes?: QuestionType[];
}

export interface GenerateQuizByTextPayload {
	title: string;
	description: string;
	content: string;
	preferences?: GenerateQuizPreferences;
}

export interface QuizQuestion {
	type: QuestionType;
	content: string;
	options?: string[];
	answer: string;
	explanation?: string;
	difficulty: DifficultyLevel | string;
}

export interface GenerateQuizByTextResponse {
	quiz: {
		title: string;
		description: string;
		userId?: string;
	};
	noOfQuestions: number;
	questions: {
		questions: QuizQuestion[];
	};
	creditsCharged?: number;
}

