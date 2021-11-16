create table login (
	id integer primary key AUTOINCREMENT,
	user_name text not null,
    password integer default 0
);