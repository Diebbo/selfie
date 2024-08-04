// register object

export interface Login {
	username: string;
	password: string;
}

export interface Register extends Login {
	name: string;
	surname: string;
	email: string;

	birthDate: Date;

	phoneNumber?: string;
	address: string;
	city: string;
	state: string;
	zip: string;
	country: string;
}

