#!/bin/sh
#
# This script publishes current build to gh-pages branch
#
set -e

cd "$(dirname $0)"

# check for changes and abort
if ! git diff-index --quiet HEAD
then
  echo "Current checkout has changes. Please commit first."
  exit 1
fi

# check current commits are pushed
if test -n "$(git rev-list @{u}..HEAD)"
then
  echo "Current checkout is ahead of remote. Please push first."
  exit 2
fi

# perform fresh build
yarn run build

repo="$(git remote get-url origin)"
if test -z "$1"
then
  message="Update to revision $(git rev-parse --short HEAD)"
else
  message="$1"
fi

# create gh-pages subdir
test -d .gh-pages || git clone $repo .gh-pages
# update
cd .gh-pages
git checkout --quiet gh-pages
git pull origin gh-pages

# remove existing files
rm -rf *
# copy in current dist files
cp -a ../dist/* .

# commit and push
git add .
git commit -m "$message"
git push origin gh-pages
