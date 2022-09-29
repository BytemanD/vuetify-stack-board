PROJECT=vstackboard

FILE_DIR=$(dirname $0)

main() {
    if [[ -z $1 ]]; then
        echo "Usage: sh $0 <WHEEL_FILE> [RETISTRY1] [RETISTRY2] ..."
        echo "       WHEEL_FILE:  e.g. dist/vstackboard-0.0.1-py3-none-any.whl"
        echo "         RETISTRYx:  e.g. registry1:5100 registry2:5100"
        return 1
    fi

    local packagePath="$(pwd)/$1"
    shift
    local registries=$*

    echo $packagePath ${FILE_DIR}
    if [[ ! -f $packagePath ]]; then
        echo "ERROR:" "Invalid package file ${packagePath}"
        return 1
    fi
    cd $FILE_DIR

    cp ${packagePath} ./ || return 1

    local packageName=$(basename $packagePath)
    local version=$(echo ${packageName} | awk -F '-' '{print $2}')

    docker build \
        --network=host \
        --build-arg PACKAGE_NAME=${packageName} \
        -t ${PROJECT}:${version} \
        ./
    rm -rf *.whl
    echo "INFO:" "builded image: ${PROJECT}:${version}"

    for registry in ${registries[*]}
    do
        docker tag ${PROJECT}:${version} ${registry}/${PROJECT}:${version}
        docker push ${registry}/${PROJECT}:${version}

        docker tag ${PROJECT}:${version} ${registry}/${PROJECT}:latest
        docker push ${registry}/${PROJECT}:latest
    done
}

main $*
