PROJECT=vstackboard

FILE_DIR=$(dirname $0)

main() {
    if [[ -z $1 ]]; then
        echo "Usage: sh $0 <WHEEL_FILE>"
        echo "       WHEEL_FILE:  e.g. dist/vstackboard-0.0.1-py3-none-any.whl"
        return 1
    fi
    local packagePath="$(pwd)/$1"

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
    echo ${PROJECT}:${version}
}

main $1
