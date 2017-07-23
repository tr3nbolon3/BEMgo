#!/bin/bash
mkdir app/blocks/$1
touch app/blocks/$1/$1.sass
touch app/blocks/$1/$1.pug

echo -e "@import '../blocks/$1/$1'" >> app/sass/main.sass
sed -i -e '1 s/^/include ..\/blocks\/'$1'\/'$1'\n/;' app/layouts/main.pug
echo -e "mixin $1()\n  div.$1" >> app/blocks/$1/$1.pug
echo -e ".$1\n  " >> app/blocks/$1/$1.sass

echo "Блок $1 создан"