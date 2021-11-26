create table ml (
	id integer primary key AUTOINCREMENT,
	user_name text not null,
	crop_type text not null,
    feedback text not null,
	classname TEXT NOT NULL
);