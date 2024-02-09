create table users(
id int primary key auto_increment,
email varchar(100),
password varchar(100),
is_active boolean default 1,
created_at datetime default current_timestamp,
updated_at datetime null on update  current_timestamp
);
use  netflix;
SHOW GRANTS FOR 'root'@'localhost';

insert into users values (1,"vasant@gmail.com","abc",1,'2023-1-10 12:10:00','2023-2-20 3:10:00');

select * from users;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Vasant@26';
flush privileges;

create table profiles(
id int primary key auto_increment,
user_id int,
name varchar(50)not null,
type enum('kid','adult') not null,
foreign key(user_id)  references users(id),
is_active boolean default 1,
created_at datetime default current_timestamp,
updated_at datetime null on update  current_timestamp
);

create table videos(
id int primary key auto_increment,
title varchar(255) not null,
description text,
cast text,
is_active boolean default 1,
created_at datetime default current_timestamp,
updated_at datetime null on update  current_timestamp
);

create table actors(
id int primary key auto_increment,
name varchar(100) not null,
is_active boolean default 1,
created_at datetime default current_timestamp,
updated_at datetime null on update  current_timestamp
);

create table actor_in_videos(
id int primary key auto_increment,
actor_id int,
video_id int,
foreign key(actor_id) references actors(id),
foreign key(video_id) references videos(id),
is_active boolean default 1,
created_at datetime default current_timestamp,
updated_at datetime null on update  current_timestamp
);

create table videostatus(
id int primary key auto_increment,
profile_id int not null,
video_id int not null,
status enum ('completed','in progress') not null,
lastwatch timestamp,
foreign key(profile_id) references profiles(id),
foreign key(video_id) references videos(id),
is_active boolean default 1,
created_at datetime default current_timestamp,
updated_at datetime null on update  current_timestamp
);