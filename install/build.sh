PROJECT=vstackboard

FILE_DIR=$(dirname $0)

main() {
    local packagePath=$(ls ${FILE_DIR}/../dist/${PROJECT}-*-any.whl 2> /dev/null)

    if [[ -z ${packagePath} ]] ; then
        echo "INFO:" "building wheel package"
        cd ${FILE_DIR}/../
        rm -rf build dist
        python3 setup.py bdist_wheel
        packagePath=$(ls ${FILE_DIR}/../dist/${PROJECT}-*-any.whl)
        if [[ ! -f ${packagePath} ]]; then
            echo "ERROR:" "build wheel failed"
            return 1
        fi
        cd -
    else
        echo "WARNING:" "wheel package is exists, skip to build wheel package"
    fi
    cp ${packagePath} ${FILE_DIR} || return 1

    local packageName=$(basename ${packagePath})
    local version=$(echo ${packageName} | awk -F '-' '{print $2}')

    cd ${FILE_DIR}
    docker.exe build \
        --network=host \
        --build-arg PACKAGE_NAME=${packageName} \
        -t ${PROJECT}:${version} \
        ./
    rm -rf *.whl
}

main
