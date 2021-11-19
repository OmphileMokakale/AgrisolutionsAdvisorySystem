create table user_profile (
	id integer primary key AUTOINCREMENT,
	full_name text not null,
	age text not null,
    location text not null,
    landsize text not null,
    soiltype text not null,
    croptype text not null
);