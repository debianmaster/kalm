import { Box, Button, Grid, Icon } from "@material-ui/core";
import Immutable from "immutable";
import React from "react";
import { connect, DispatchProp } from "react-redux";
import { arrayPush, WrappedFieldArrayProps } from "redux-form";
import { Field, FieldArray } from "redux-form/immutable";
import { getComponentFormVolumeType } from "selectors/component";
import { DeleteIcon } from "widgets/Icon";
import { IconButtonWithTooltip } from "widgets/IconButtonWithTooltip";
import { RootState } from "../../reducers";
import { getComponentFormVolumeOptions } from "../../selectors/component";
import {
  Volume,
  VolumeTypePersistentVolumeClaim,
  VolumeTypePersistentVolumeClaimNew,
  VolumeTypeTemporaryDisk,
  VolumeTypeTemporaryMemory,
} from "../../types/componentTemplate";
import { RenderSelectField } from "../Basic/select";
import { KRenderTextField } from "../Basic/textfield";
import { ValidatorRequired, ValidatorVolumeSize } from "../validator";

const mapStateToProps = (state: RootState) => {
  return {
    volumeOptions: getComponentFormVolumeOptions(),
    storageClasses: state.get("persistentVolumes").get("storageClasses"),
  };
};

interface FieldArrayComponentHackType {
  name: any;
  component: any;
}

interface FieldArrayProps extends DispatchProp, ReturnType<typeof mapStateToProps> {}

interface Props extends WrappedFieldArrayProps<Volume>, FieldArrayComponentHackType, FieldArrayProps {}

class RenderVolumes extends React.PureComponent<Props> {
  private getClaimNameOptions() {
    const { volumeOptions } = this.props;

    const options: {
      value: string;
      text: string;
    }[] = [];

    volumeOptions.forEach((pv) => {
      options.push({
        value: pv.get("name"),
        text: pv.get("name"),
      });
    });

    return options;
  }

  private getStorageClassesOptions() {
    const { storageClasses } = this.props;

    const options: {
      value: string;
      text: string;
    }[] = [];

    storageClasses.forEach((sc) => {
      options.push({
        value: sc.get("name"),
        text: sc.get("name"),
      });
    });

    return options;
  }

  public render() {
    const {
      fields,
      dispatch,
      meta: { submitFailed, error, form },
    } = this.props;

    return (
      <Box>
        <Box mb={2}>
          <Grid item xs>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Icon>add</Icon>}
              size="small"
              onClick={() => {
                dispatch(arrayPush(form, fields.name, Immutable.Map({})));
              }}
            >
              Add
            </Button>
            {submitFailed && error && <span>{error}</span>}
          </Grid>
        </Box>

        {fields.map((member, index) => {
          const volumeType = getComponentFormVolumeType(member);
          return (
            <Grid container spacing={2} key={member}>
              <Grid item xs key={index}>
                <Field
                  name={`${member}.type`}
                  component={RenderSelectField}
                  label="Type"
                  validate={[ValidatorRequired]}
                  placeholder="Select a volume type"
                  options={[
                    // { value: VolumeTypePersistentVolumeClaim, text: "Mount a disk" },
                    { value: VolumeTypePersistentVolumeClaimNew, text: "Create and mount disk" },
                    { value: VolumeTypePersistentVolumeClaim, text: "Mount an existing disk" },
                    { value: VolumeTypeTemporaryDisk, text: "Mount a temporary disk" },
                    { value: VolumeTypeTemporaryMemory, text: "Mount a temporary memory disk" },
                  ]}
                ></Field>
              </Grid>
              <Grid item xs>
                <Field
                  component={KRenderTextField}
                  name={`${member}.path`}
                  label="Mount Path"
                  margin
                  validate={[ValidatorRequired]}
                />
              </Grid>
              {volumeType === VolumeTypePersistentVolumeClaim && (
                <Grid item xs>
                  <Field
                    name={`${member}.pvc`}
                    component={RenderSelectField}
                    label="Claim Name"
                    // validate={[ValidatorRequired]}
                    placeholder="Select a Claim Name"
                    options={this.getClaimNameOptions()}
                  ></Field>
                </Grid>
              )}
              {volumeType === VolumeTypePersistentVolumeClaim && (
                <Grid item xs>
                  <Field
                    disabled={true}
                    label="Storage Class"
                    name={`${member}.storageClassName`}
                    component={RenderSelectField}
                    placeholder="Select the type of your disk"
                    options={this.getStorageClassesOptions()}
                  ></Field>
                </Grid>
              )}
              {volumeType === VolumeTypePersistentVolumeClaim && (
                <Grid item xs>
                  <Field
                    label="Storage Class"
                    name={`${member}.storageClassName`}
                    component={RenderSelectField}
                    placeholder="Select the type of your disk"
                    options={this.getStorageClassesOptions()}
                  ></Field>
                </Grid>
              )}
              <Grid item xs>
                <Field
                  disabled={volumeType === VolumeTypePersistentVolumeClaim}
                  component={KRenderTextField}
                  name={`${member}.size`}
                  label="Size"
                  margin
                  validate={[ValidatorRequired, ValidatorVolumeSize]}
                />
              </Grid>
              <Grid item xs>
                <IconButtonWithTooltip
                  tooltipPlacement="top"
                  tooltipTitle="Delete"
                  aria-label="delete"
                  onClick={() => fields.remove(index)}
                >
                  <DeleteIcon />
                </IconButtonWithTooltip>
              </Grid>
            </Grid>
          );
        })}
      </Box>
    );
  }
}

export const Disks = connect(mapStateToProps)((props: FieldArrayProps) => {
  return <FieldArray name="volumes" component={RenderVolumes} {...props} />;
});
