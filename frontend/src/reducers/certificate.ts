import Immutable from "immutable";
import { Actions } from "../types";
import { ImmutableMap } from "../typings";
import {
  LOAD_CERTIFICATES_FAILED,
  LOAD_CERTIFICATES_PENDING,
  CertificateList,
  SET_IS_SUBMITTING_CERTIFICATE,
  LOAD_CERTIFICATES_FULFILLED
} from "types/certificate";

export type State = ImmutableMap<{
  isLoading: boolean;
  isFirstLoaded: boolean;
  isSubmittingCreateCertificate: boolean;
  certificates: CertificateList;
}>;

const initialState: State = Immutable.Map({
  isLoading: false,
  isFirstLoaded: false,
  isSubmittingCreateCertificate: false,
  certificates: Immutable.List([
    {
      name: "ddex-1",
      isSelfManaged: true,
      selfManagedCertContent: "crt",
      selfManagedCertPrivateKey: "pk",
      domains: ["ddex.io"]
    }
  ])
});

const reducer = (state: State = initialState, action: Actions): State => {
  switch (action.type) {
    case LOAD_CERTIFICATES_PENDING: {
      return state.set("isLoading", true);
    }
    case LOAD_CERTIFICATES_FAILED: {
      return state.set("isLoading", false);
    }
    case LOAD_CERTIFICATES_FULFILLED: {
      return state.set("certificates", action.payload.certificates);
    }
    case SET_IS_SUBMITTING_CERTIFICATE: {
      return state.set("isSubmittingCreateCertificate", action.payload.isSubmittingCertificate);
    }
  }

  return state;
};

export default reducer;
