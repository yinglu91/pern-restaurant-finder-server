create database yelp;
\ c yelp;
--
create table restaurants (
  id bigserial primary key,
  name varchar(50) not null,
  location varchar(50) not null,
  price_range INT not null check(
    price_range >= 1
    and price_range <= 5
  )
);
--
drop table restaurants;
\ d restaurants
insert into restaurants(name, location, price_range)
values ('McDonalds', 'New Yorks', 3);
--
select *
from restaurants;
--
insert into restaurants(name, location, price_range)
values ('Pizza Hut', 'Vegas', 2);
--
insert into restaurants(name, location, price_range)
values ('Vendys', 'Denver', 3);
--
-- reviews
CREATE TABLE reviews(
  id BIGSERIAL NOT NULL PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id),
  name VARCHAR(50) NOT NULL,
  review TEXT NOT NULL,
  rating INT NOT NULL check(
    rating >= 1
    and rating <= 5
  )
);
--
--
insert into reviews (restaurant_id, name, review, rating)
values(3, 'Ying', 'good food', 4);
insert into reviews (restaurant_id, name, review, rating)
values(3, 'Frank', 'so so food', 2);
insert into reviews (restaurant_id, name, review, rating)
values(3, 'Damien', 'I dont like food', 1);