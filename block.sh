#!/bin/bash
mkdir app/blocks/$1
touch app/blocks/$1/$1.sass
touch app/blocks/$1/$1.pug

sed -i '1 s/^/include ..\/blocks\/'$1'\/'$1'\n/;' app/layouts/main.pug
echo "@import '../blocks/$1/$1'" >> app/sass/main.sass
echo "mixin $1()\n  div.$1&attributes(attributes)" >> app/blocks/$1/$1.pug
echo ".$1\n  " >> app/blocks/$1/$1.sass

echo "Блок $1 создан"
